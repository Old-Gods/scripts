import { readFile, writeFile } from 'node:fs/promises'

export async function loadJSON(fileName: string) {
  return JSON.parse((await readFile(fileName)).toString())
}

export async function saveJSON(fileName: string, json: any) {
  return writeFile(fileName, JSON.stringify(json, null, 2))
}
