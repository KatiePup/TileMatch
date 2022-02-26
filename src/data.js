// Some imports that we don't need anymore...
// import IPFS from 'ipfs'
// import { create } from 'ipfs-http-client'


export function setupIpfsClient () {
    // window.
    const ipfsOptions = { repo: './ipfs' }
    return window.IpfsHttpClientLite(ipfsOptions)

}