/* eslint-disable */
/* global IpfsCore */

// Some imports that we don't need anymore...
// import IPFS from 'ipfs'
// import { create } from 'ipfs-http-client'
// import { create } from 'ipfs-core'

export async function setupIpfsClient() {
    const options = {
        EXPERIMENTAL: { pubsub: true },
        relay: { enabled: true, hop: { enabled: true, active: true } },
        repo: './ipfs'
    }
    // await NPP.node.bootstrap.list()

    const pending = IpfsCore.create(options)
    // const pending =  window.IpfsHttpClientLite(options)

    pending.then(async (client) => {
        console.log("Connected to IPFS", { client });
        console.log(await client.bootstrap.list())


        // Returns the identity of the Peer.
        const { agentVersion, id } = await client.id();

        console.log({
            id,
            agentVersion,
            client,
            isOnline: client.isOnline()
        })
    })

    return pending
}

export function getDatabaseName(params) {
    return window.location?.hash?.substring(1)  ?? 'TileMatch'
}
