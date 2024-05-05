import Contract from '@/services/contract'
import { CONTRACTS } from '@/const/contracts'
import web3 from '@/services/web3'
import { isAddressCorrect } from '@/utils/web3'

class Midi {
  constructor() {
    this.contract = new Contract(CONTRACTS.token.address, CONTRACTS.token.abi)
  }

  async getBalance(address) {
    return this.contract.call('balanceOf', [address])
  }

  async getSupply() {
    return this.contract.call('totalSupply')
  }

  async getDecimals() {
    return this.contract.call('decimals')
  }

  async getSeedByIndex(address, index) {
    return this.contract.call('cassetteOfOwnerByIndex', [address, index])
  }

  async getSeedSvg(seed) {
    return this.contract.call('getSvg', [seed])
  }

  async getSeedMeta(seed) {
    return this.contract.call('getMeta', [seed])
  }

  async getHoldersAmount() {
    return this.contract.call('holdersCount')
  }

  async getInscriptionSupply() {
    const [records, cassettes] = await Promise.all([
      this.contract.call('recordingsTotalCount'),
      this.contract.call('cassettesTotalCount'),
    ])

    return Number(records) + Number(cassettes)
  }

  // Given a seen, it returns the inscription data (svg and metadata)
  // The metadata needs to have a key containing the MIDI hash
  async getInscription(seed) {
    const [
      svg,
      meta,
    ] = await Promise.all([
      this.getSeedSvg(seed),
      this.getSeedMeta(seed),
    ])

    return {
      svg,
      seed,
      meta: JSON.parse(meta),
    }
  }

  // Added a new method to get the audio from the MIDI hash
  async midiHashToMidiUrl(midiHash) {
    const byteArray = new Uint8Array(midiHash.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
    const blob = new Blob([byteArray], { type: 'audio/midi' });
    console.log(blob);

    return URL.createObjectURL(blob);
  }

  async base64ToMidiUrl(base64String) {
    const byteArray = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
    const blob = new Blob([byteArray], { type: 'audio/midi' });
    console.log(blob);
  
    return URL.createObjectURL(blob);
  }

  async getInscriptionsByAddress(address) {
    const [
      count,
      degree,
    ] = await Promise.all([
      this.contract.call('cassetteCount', [address]),
      this.contract.call('recordingsDegree', [address]),
    ])

    const seedPromises = []

    for (let index = 0; index < count; index++) {
      seedPromises.push(this.getSeedByIndex(address, index))
    }

    let seeds = await Promise.all(seedPromises)

    seeds = seeds.map(seed => ({ seed: seed.seed, extra: seed.extra, owner: address }))

    if (Number(degree.seed)) {
      seeds.unshift({ isDynamic: true, seed: degree.seed, extra: degree.extra, owner: address })
    }

    return seeds
  }

  async getHolders(fromIndex = 0, holderAmount = 4) {
    const holders = await this.contract.call('getHoldersList', [fromIndex, holderAmount])
    return holders.filter(address => !address.startsWith('0x000000'))
  }

  async getHoldersSeeds(fromIndex = 200, amount = 4) {
    const holders = await this.getHolders(fromIndex, amount)

    const holdersSeeds = await Promise.all(
      holders.map(address => this.getInscriptionsByAddress(address))
    )

    let seeds = []

    for (let holderSeeds of holdersSeeds) {
      seeds = [...seeds, ...holderSeeds]
    }

    // reverse the order
    seeds = seeds.reverse()

    return seeds
  }

  async fetchInscriptionsBySeeds(seeds) {
    const promises = []

    for (let seed of seeds) {
      promises.push(midi.getInscription(seed))
    }

    let list = await Promise.all(promises)

    return list || []
  }

  async fetchSeedsByAddress(address) {
    if (address && isAddressCorrect) {
      return midi.getInscriptionsByAddress(address)
    }

    return []
  }
}

const midi = new Midi()

export default midi