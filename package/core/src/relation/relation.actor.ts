import { GeoTriple, SemanticRelation } from './relation.type'

interface RelationProps {
  setTripleListMap(value: Map<string, Set<GeoTriple>>): void
  getTripleListMap(): Map<string, Set<GeoTriple>>
  getTripleListOfObject(objectUUID: string): Set<GeoTriple> | null
  setSemanticMap(value: Map<string, SemanticRelation>): void
  getSemanticMap(): Map<string, SemanticRelation>
}

export class Relation implements RelationProps {
  // the uuid of tripleListMap is the same as geolocusObject
  // the uuid of tripleList is auto generate
  private _tripleListMap: Map<string, Set<GeoTriple>>
  private _semanticMap: Map<string, SemanticRelation>

  constructor() {
    this._tripleListMap = new Map()
    this._semanticMap = new Map()
  }

  setTripleListMap(value: Map<string, Set<GeoTriple>>): void {
    this._tripleListMap = value
  }

  getTripleListMap(): Map<string, Set<GeoTriple>> {
    return this._tripleListMap
  }

  getTripleListOfObject(objectUUID: string): Set<GeoTriple> | null {
    return this._tripleListMap.get(objectUUID) || null
  }

  setSemanticMap(value: Map<string, SemanticRelation>): void {
    this._semanticMap = value
  }

  getSemanticMap(): Map<string, SemanticRelation> {
    return this._semanticMap
  }
}
