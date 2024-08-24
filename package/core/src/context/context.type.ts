export interface RouteNode {
  parent: Set<string> | null
  children: Set<string> | null
}
