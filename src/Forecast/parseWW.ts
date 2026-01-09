// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function parseCliboard (e:any, options:any = {}) {
  const {
    rowSelector = 'tr',
    cellSelector = 'td',
    inputSelector = 'input'
  } = options || {}


  if (!e || !e.target || !e.clipboardData) return
  //if (e.target.parentNode.querySelector(inputSelector) !== e.target) return


  let currentInput = e.target
  let currentCell = e.target.closest(cellSelector)
  let currentRow = e.target.closest(rowSelector)

  if (!currentCell || !currentRow) return

  e.preventDefault()
  const startIndex = Array.from(currentRow.querySelectorAll(cellSelector)).indexOf(currentCell)
  
  const data = parseData(e.clipboardData.getData('text/plain'))

  let i = 0;
  
  for (const row of data) {
    for (const value of row) {
        if (![0,6,6,7,9,20].includes(i++)) continue;

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        currentInput.contentEditable === 'true'
            ? currentInput.value = value
            : currentInput.value = value

      const inputEvent = new Event('input', { bubbles: true })
      currentInput.dispatchEvent(inputEvent)

      const blurEvent = new Event('blur', { bubbles: true })
      currentInput.dispatchEvent(blurEvent)

      // Column overflow
      currentCell = currentInput.closest(cellSelector)
      if (!currentCell || !currentCell.nextElementSibling) break

      // Non-input element
      currentInput = currentCell.nextElementSibling.querySelector(inputSelector)
      if (!currentInput) break
    }

    // Row overflow
    currentRow = currentRow.nextElementSibling
    if (!currentRow) break

    // Non-table cell element
    currentCell = currentRow.querySelectorAll(cellSelector)[startIndex]
    if (!currentCell) break

    // Non-input element
    currentInput = currentCell.querySelector(inputSelector)
    if (!currentInput) break
  }
}

function parseData (data: string): string[][] {
  return data.trim().split(/\r\n|\n|\r/).map(row => row.split('\t'))
}
