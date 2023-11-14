import { Command, Option } from 'clipanion'
import { formatError } from '../../../bandcamp'
import ora, { Ora } from 'ora'
import * as t from 'typanion'

export abstract class BandcampCommand extends Command {
  #spinner?: Ora

  override async catch(error: unknown) {
    this.#spinner?.stop()
    this.context.stderr.write(formatError(error) + '\n')
  }

  protected startSpinner(label: string) {
    const spinner = (this.#spinner = ora(label).start())
    return spinner
  }

  static BandIdOption() {
    return Option.String('-b,--band_id', {
      description:
        'Bandcamp ID of your label or the (usually) label on whose behalf you are querying.',
      required: true,
      validator: t.isNumber(),
    })
  }

  static MemberBandIdOption() {
    return Option.String('-m,--member_band_id', {
      description:
        'Bandcamp ID of the band on which you wish to filter results.',
      validator: t.isNumber(),
    })
  }
}
