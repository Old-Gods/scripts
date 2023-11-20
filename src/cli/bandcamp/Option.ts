import { Option } from 'clipanion'
import * as t from 'typanion'

export function BandIdOption(): number
export function BandIdOption(required: true): number
export function BandIdOption(required: false): number | undefined
export function BandIdOption(required = true) {
  return Option.String('-b,--band_id', {
    description:
      'Bandcamp ID of your label or the (usually) label on whose behalf you are querying.',
    required,
    validator: t.isNumber(),
  })
}

export function MemberBandIdOption() {
  return Option.String('-m,--member_band_id', {
    description: 'Bandcamp ID of the band on which you wish to filter results.',
    validator: t.isNumber(),
  })
}
