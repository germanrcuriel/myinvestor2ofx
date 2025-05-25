const BANK_WEIGHTS = [4, 8, 5, 10, 9, 7, 3, 6]
const ACCOUNT_WEIGHTS = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6]

const getDigit = (input, weights) => {
  const sum = input
    .split('')
    .reduce((acc, digit, index) => acc + (parseInt(digit, 10) * weights[index]), 0)

  const remainder = sum % 11
  const result = 11 - remainder

  if (result === 10) return '1'
  if (result === 11) return '0'

  return String(result)
}

export const calcControlDigit = (id, branch, account) => {
  const dc1 = getDigit(`${id}${branch}`, BANK_WEIGHTS)
  const dc2 = getDigit(account, ACCOUNT_WEIGHTS)

  return `${dc1}${dc2}`
}
