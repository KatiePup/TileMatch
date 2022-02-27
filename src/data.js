/* eslint-disable */
/* global IpfsCore */

// Some imports that we don't need anymore...
// import IPFS from 'ipfs'
// import { create } from 'ipfs-http-client'
// import { create } from 'ipfs-core'

export async function setupIpfsClient() {
    const options = { repo: './ipfs' }

    const pending = IpfsCore.create(options)
    // const pending =  window.IpfsHttpClientLite(options)

    pending.then(async (client) => {
        console.log("Connected to IPFS");

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
