import { Command, Option } from 'clipanion'
import * as t from 'typanion'
import { login } from '../../../bandcamp'
import env from '../../../dotenv'
import { BandcampCommand } from './BandcampCommand'

export class BandcampLoginCommand extends BandcampCommand {
  static override paths: string[][] = [['login']]

  static override usage = Command.Usage({
    description: 'Log in to bandcamp',
  })

  readonly client_id = Option.String('-i,--client_id', env.BANDCAMP_CLIENT_ID, {
    validator: t.isNumber(),
  })

  readonly client_secret = Option.String(
    '-s,--client_secret',
    env.BANDCAMP_CLIENT_SECRET,
  )

  override async execute() {
    await login(this)
    this.context.stdout.write('Success\n')
  }
}
