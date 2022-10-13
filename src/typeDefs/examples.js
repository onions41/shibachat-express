export default `
  type Query {
    example1: Person!
    findUser(nickname: String!): User
  }

  type Person {
    name: String!
    height: Int!
  }

  type User {
    id: Int!
    nickname: String!
    password: String!
  }
`
