import { Command } from 'clipanion'
import { getMyBands } from '../../../bandcamp'
import Table from 'cli-table3'
import { BandcampCommand } from './BandcampCommand'

export class BandcampBandsCommand extends BandcampCommand {
  static override paths: string[][] = [['bands']]

  static override usage = Command.Usage({
    description: 'Get your band(s) info',
  })

  override async execute() {
    const myBands = await getMyBands()

    if (!myBands) return

    const table = new Table({
      head: ['id', 'name', 'subdomain'],
    })

    for (const band of myBands) {
      table.push([band.band_id, band.name, band.subdomain])
    }

    this.context.stdout.write(table.toString() + '\n')
  }
}
