/* eslint-disable */
/* global IpfsCore */

// Some imports that we don't need anymore...
// import IPFS from 'ipfs'
// import { create } from 'ipfs-http-client'
// import { create } from 'ipfs-core'

import { shallowRef } from 'vue'
import OrbitDB from 'orbit-db'

/**
 * A reference to the current IPFS connection.
 *
 * @see https://vuejs.org/guide/extras/reactivity-in-depth.html#integration-with-external-state-systems
 */
let ipfsNode = shallowRef(null)

/**
 * A reference to the current Orbit instance.
 *
 * @see https://vuejs.org/guide/extras/reactivity-in-depth.html#integration-with-external-state-systems
 */
let oribitClient = shallowRef(null)

/**
 * A reference to the current Orbit instance.
 *
 * @see https://vuejs.org/guide/extras/reactivity-in-depth.html#integration-with-external-state-systems
 */
let databaseInstance = shallowRef(null)

/**
 *
 * @see https://github.com/orbitdb/field-manual/blob/main/01_Tutorial/04_P2P_Part_1.md
 */
export async function getIpfsNode() {
    // Use existing node if it's connected.
    if (ipfsNode.value && (await ipfsNode.value).isOnline()) {
        return ipfsNode.value
    }

    const options = {
        preload: { enabled: false },
        EXPERIMENTAL: { pubsub: true },


        relay: { enabled: true, hop: { enabled: true, active: true } },

        // Give write access to everyone
        accessController: {
            write: ['*']
        }
    }

    //
    console.log("Setting up IPFS node...")

    ipfsNode.value = IpfsCore.create(options)

    //
    const client = await ipfsNode.value

    console.log("Connected to IPFS!", { client });
    // console.log(await client.bootstrap.list())

    // Returns the identity of the Peer.
    const { agentVersion, id } = await client.id();

    console.log({
        id,
        agentVersion,
        client,
        isOnline: client.isOnline()
    })

    //
    return client
}

/**
 * @see https://github.com/orbitdb/field-manual/blob/main/01_Tutorial/01_Basics.md#instantiating-ipfs-and-orbitdb
 */
export async function getOrbitClient() {
    // TODO: Some better checks here.
    if (oribitClient.value && oribitClient.value) {
        return await oribitClient.value
    }

    //
    const node = await getIpfsNode();

    //
    console.log('Setting up OrbitDB client...', { node })

    oribitClient.value = OrbitDB.createInstance(node)

    //
    return await oribitClient.value
}

export async function getDatabase() {
    if (databaseInstance.value) {
        return await databaseInstance.value
    }

    //
    const name = getDatabaseNameFromUrl('TileMatch')

    const defaultOptions = {
        replicate: true,

        // Give write access to everyone
        accessController: {
            type: 'orbitdb',
            admin: ['*'],
            write: ['*'],
        },
    }

    //
    console.log('Loading database...', { name, defaultOptions })

    const client = await getOrbitClient()

    databaseInstance.value = client.eventlog(name, {
        ...defaultOptions,
    })

    const db = await databaseInstance.value

    console.log('Opened database.', { db })

    // Some debug logs...
    db.events.on('replicated', () => {
        console.log('replicated!')

        // this.fetchMessages()
    })

    return db
}

export function getDatabaseNameFromUrl(defaultName) {
    return window.location?.hash?.substring(1) ?? defaultName
}
