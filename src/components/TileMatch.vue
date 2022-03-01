<template>
  <div>bum</div>
</template>

<script>
import OrbitDB from 'orbit-db'

import { v4 as uuidv4 } from 'uuid'
import { getDatabase, getDatabaseNameFromUrl, getIpfsNode } from '../data'

// main()
export default {
  setup() {
    // return { lastEntry: ref(null) }
  },

  data: function () {
    return {
      // ipfs: null,
      ipfsdbReady: false,
      // orbitdb: null,
      // db: null,
      lastEntry: null,
      dbCache: [],
      gameID: null,
      gameData: null,
      gameFound: false,
      gameOver: false,
      hashCheck: null,
      size: {
        x: 4,
        y: 4,
      },
      playerN: null,
      turnN: 0,
      pairsFound: null,
      score: null,
    }
  },

  async created() {
    //
    console.log('Setting up IPFS network...', getDatabaseNameFromUrl())

    // Trigger when IPFS connection is available.
    getIpfsNode().then((client) => {
      this.ipfsdbREADY = true
    })

    // Setup the database...
    await getDatabase()

    await this.collectMessagesOnTimer()
  },

  async mounted() {
    // Setup the database...
    const db = await getDatabase()

    // Set url...
    window.location.hash = db.address.toString()

    setTimeout(() => {
      this.findGame()
    }, 2000)
  },

  methods: {
    // Automatically collect messages
    async fetchMessages() {
      console.log('Checking for updates...')

      const db = await getDatabase()

      // Get last entry to db
      const currentLastEntry = await db
        .iterator({ reverse: true, limit: 1 })
        .collect()
        .find((e) => e.payload.value)

      // If last entry is not the same as cached
      // update full local db cache
      if (this.lastEntry?.hash === currentLastEntry?.hash) {
        console.log('Up to date.')
        return
      }

      console.log('Has updates, fetching messages...')
      console.log({ last: currentLastEntry })

      const messages = await db.iterator({ reverse: true, limit: -1 }).collect()

      // Update local cache...
      this.dbcache = messages.map((e) => e.payload.value)
      this.lastEntry = messages[0]

      const { lastEntry, dbCache } = this

      console.log({ messages, currentLastEntry, lastEntry, dbCache })

      return messages
    },

    async collectMessagesOnTimer() {
      // Async and recurs stuff to keep it calling
      await this.fetchMessages()

      if (!this.gameOver) {
        setTimeout(() => this.collectMessagesOnTimer(), 5000)
      }
    },

    async sendMessage(message) {
      const { db, ipfsdbREADY } = this

      console.info('Sending message')
      console.log({ message, db, ipfsdbREADY })

      // Send message to orbitdb
      if (ipfsdbREADY === true && db) {
        // const db = await db

        // Deep clone message object to remove any of Vue's proxies.
        // https://vuejs.org/guide/extras/reactivity-in-depth.html#how-reactivity-works-in-vue
        const rawMessage = JSON.parse(JSON.stringify(message))

        console.log('Sending Message', { rawMessage, db })

        return (await db).add({ ...rawMessage })
      }
    },

    async findGame() {
      console.log('Finding Game')
      // Blank array to cache accepted gameIDs
      let alreadyAccepted = []
      // Loop through each db message
      await this.dbCache?.forEach(async (message) => {
        // TODO check if the entry is too old

        if (message.moveID === 'request') {
          //
          if (!alreadyAccepted.includes(message.gameID)) {
            this.gameID = message.gameID
            this.gameData = message.gameData
            const acceptMessage = {
              gameID: this.gameID,
              gameData: this.gameData,
              moveID: 'accept',
            }
            console.log('Found game, sending accept message')
            console.log('GameID', this.gameID)
            this.hashCheck = await this.sendMessage(acceptMessage)
            this.acceptGameCheck()
            return
          }
        } else if (message.moveID === 'accept') {
          alreadyAccepted.push(message.gameID)
        }
      })

      if (!this.gameFound) {
        this.gameData = this.generateGameData()
        this.gameID = uuidv4()
        const requestMessage = {
          gameID: this.gameID,
          gameData: this.gameData,
          moveID: 'request',
        }
        this.hashCheck = await this.sendMessage(requestMessage)
        this.awaitAccept()
      }
    },

    acceptGameCheck() {
      let keepChecking = true
      const timerFunc = () => {
        this.dbCache.forEach((message) => {
          if (message.gameID === this.gameID && message.moveID === 'accept') {
            if (message.hash === this.hashCheck) {
              this.gameFound = true
              this.playerN = 1
              keepChecking = false
              this.awaitTurn()
              return
            } else {
              console.log('Someone else accepted first! /nFinding new game')
              keepChecking = false
              this.findGame()
              return
            }
          }
        })
        if (keepChecking) {
          setTimeout(() => {
            timerFunc()
          }, 1000)
        }
      }
    },

    generateGameData(
      // Default Size
      size = {
        x: 4,
        y: 4,
      }
    ) {
      // Function Start
      // Generate list of all cell coordinates
      let cells = []
      for (let i = 0; i < size.x; i++) {
        for (let j = 0; j < size.y; j++) {
          cells.push([i, j])
        }
      }
      // Randomise those into a list of pairs
      let pairs = []
      let tempPair = []
      let random = null
      for (let i = 0; i < size.x * size.y * 0.5; i++) {
        random = Math.floor(Math.random() * cells.length)
        tempPair[0] = [cells[random]]
        cells = cells.slice(random, 1)
        random = Math.floor(Math.random() * cells.length)
        tempPair[1] = [cells[random]]
        cells = cells.slice(random, 1)
        pairs[i] = tempPair
      }
      // Return gameData object
      return {
        size: size,
        pairs: pairs,
      }
    },

    awaitAccept() {
      let keepChecking = true
      const timerFunc = () => {
        this.dbCache.forEach((message) => {
          if (message.gameID === this.gameID && message.moveID === 'accept') {
            this.gameFound = true
            this.playerN = 0
            keepChecking = false
            this.takeTurn()
            return
          }
        })
        if (keepChecking) {
          setTimeout(() => {
            timerFunc()
          }, 1000)
        }
      }
    },

    takeTurn() {
      const input = prompt('Please enter your guess in the form/nx1,y1;x2,y2')
      const turn = input.split(';').map((coord) => coord.split(','))

      this.turnCheck(turn, this.playerN)

      const turnMessage = {
        gameID: this.gameID,
        gameData: this.gameData,
        moveID: this.turnN,
        turn: turn,
      }
      this.hashCheck = this.sendMessage(turnMessage)

      this.turnN++

      if (this.gameOver) {
        console.log('GameOver')
      } else {
        this.awaitTurn()
      }
    },

    awaitTurn() {
      let keepChecking = true
      const timerFunc = () => {
        this.dbCache.forEach((message) => {
          if (message.gameID === this.gameID && message.moveID === this.turnN) {
            this.turnCheck(message.turn, (this.playerN + 1) % 2)
            keepChecking = false
            this.turnN++
            if (this.gameOver) {
              console.log('GameOver')
            } else {
              this.takeTurn()
            }
          }
          return
        })
        if (keepChecking) {
          setTimeout(() => {
            timerFunc()
          }, 1000)
        }
      }
    },

    turnCheck(turn, playerN) {
      const turnCheck = this.gameData.pairs.indexOf(turn)
      if (turnCheck !== -1) {
        this.pairsFound[turnCheck] = this.playerN
        this.gameData.pairs = this.gameData.pairs.slice(turnCheck, 1)
        if (playerN === this.playerN) {
          this.score++
        }
        if (this.gameData.pairs.length === 0) {
          this.gameOver = true
        }
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
