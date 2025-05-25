import md5 from 'md5'
import { basename, extname } from 'node:path'
import xlsx from 'node-xlsx'
import { generateOFX } from '../utils/ofx.js'
import { strToDatetime, strToMoney } from '../utils/str.js'

const BANK_DETAILS_ROW_INDEX = 1
const BALANCE_ROW_INDEX = 2
const STATEMENTS_START_ROW_INDEX = 8

const initialInput = () => {
  return {
    balance: null,
    bankAccount: null,
    bankBranch: '7889',
    bankId: '1544',
    currency: 'EUR',
    from: null,
    serverDate: new Date().toISOString(),
    statements: [],
    to: null
  }
}

const getDestinationFile = (file) => {
  const name = basename(file, extname(file))

  return `${name}.ofx`
}

const setBankDetails = (input, { account }) => {
  input.bankAccount = account.slice(12)
}

const setDateRange = (input, filename) => {
  const parts = filename
    .replaceAll('-', '/')
    .replace('.xlsx', '')
    .split('_')

  input.from = strToDatetime(parts[1])
  input.to = strToDatetime(parts[2])
}

const setBalance = (input, { balance }) => {
  input.balance = strToMoney(balance)
}

const setStatement = (input, { amount, date, memo }) => {
  const statementAmount = strToMoney(amount)
  const statementDate = strToDatetime(date)
  const hash = md5(`${statementAmount}${statementDate}${memo}`)

  input.statements.push({
    amount: statementAmount,
    date: statementDate,
    id: hash,
    memo
  })
}

export const convert = ({ buffer, originalname }) => {
  try {
    const [{ data }] = xlsx.parse(buffer)
    const input = initialInput()

    setDateRange(input, originalname)

    data.forEach((row, index) => {
      if (index === BANK_DETAILS_ROW_INDEX) {
        return setBankDetails(input, {
          account: row[3]
        })
      }

      if (index === BALANCE_ROW_INDEX) {
        return setBalance(input, {
          balance: row[3]
        })
      }

      if (index >= STATEMENTS_START_ROW_INDEX) {
        const amount = row[4]
        const date = row[1]
        const memo = row[2]

        if (!amount && !date && !memo) return

        return setStatement(input, {
          amount: row[4],
          date: row[1],
          memo: row[2]
        })
      }
    })

    const filename = getDestinationFile(originalname)
    const ofx = generateOFX(input)

    return {
      content: ofx,
      filename: filename
    }
  } catch (err) {
    console.error(err)
  }
}
