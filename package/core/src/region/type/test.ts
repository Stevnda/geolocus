export type Required<T> = {
  [k in keyof T]: T[k]
}

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
