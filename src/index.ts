import { GeolocusContext } from './context'

class Geolocus {
  private _context: GeolocusContext
  constructor(name: string) {
    this._context = new GeolocusContext(name)
  }
}

export const createContext = (name: string) => new Geolocus(name)
