import u from '../utils/utils.js'
export default {
  filters: {
    currency (num) {
      let settings = u.getStored('settings', {
        lang: 'en',
        nf: '.'
      }),
        currency = 'eur',
        nf = '.'
      if (settings.currency) {
        currency = settings.currency.toLowerCase()
      }
      if (settings.nf) {
        nf = settings.nf
      }
      if (nf !== ',') {
        nf = '.'
      }
      let symbol = ''
      switch (currency) {
        case 'eur':
          symbol = '€'
          break
        case 'usd':
          symbol = '$'
          break
        case 'gbp':
          symbol = '£'
          break
        case 'yen':
          symbol = '¥'
          break
      }
      let price = num.toFixed(2)
      if (nf !== '.') {
        price = price.replace('.', nf) + symbol
      } else {
        price = symbol + price
      }
      return price
    },
    round (num) {
      if (typeof num == 'number') {
        return Math.round(num)
      }
    },
    round2 (num) {
      if (typeof num == 'number') {
        return num.toFixed(2)
      }
    }
  }
}
