/* eslint-disable */
/* global IpfsCore */

// Some imports that we don't need anymore...
// import IPFS from 'ipfs'
// import { create } from 'ipfs-http-client'
// import { create } from 'ipfs-core'

export function setupIpfsClient () {
    // window.
    const options = { repo: './ipfs' }

    return IpfsCore.create(options) // eslint-disable-line

    // return window.IpfsHttpClientLite(options)

}
