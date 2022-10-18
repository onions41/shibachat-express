/**
 * This is a mock user data model, this needs to be replaced with an database.
 */

import find from 'lodash/find'

const User = {
  users: [
    { id: 1, nickname: 'Homer', password: '123456', tokenVersion: 1 },
    { id: 2, nickname: 'Marge', password: '123456', tokenVersion: 1 },
    { id: 3, nickname: 'Bart', password: '123456', tokenVersion: 1 },
    { id: 4, nickname: 'Lisa', password: '123456', tokenVersion: 1 },
    { id: 5, nickname: 'Maggie', password: '123456', tokenVersion: 1 }
  ],

  findUser: function(nickname) {
    const result = find(
      this.users, function(o) { return o.nickname === nickname }
    )
    return result
  },

  findUserById: function(id) {
    const result = find(
      this.users, function(o) { return o.id === id }
    )
    return result
  }
}

export default User
