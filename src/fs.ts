import { readFile } from 'node:fs/promises'

export async function loadJSON(fileName: string) {
  return JSON.parse((await readFile(fileName)).toString())
}
