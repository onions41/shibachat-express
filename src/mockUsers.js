/**
 * This is a mock user data model, this needs to be replaced with an database.
 */

import find from 'lodash/find'

const User = {
  users: [
    { id: 1, nickname: 'Homer', password: 'hashed44je89h2eohasd' },
    { id: 2, nickname: 'Marge', password: 'hashed44jeasgfoapis' },
    { id: 3, nickname: 'Bart', password: 'hashedssdfdsoapisdrd' },
    { id: 4, nickname: 'Lisa', password: 'hashesfdsdsgdfpisdqwgerd' },
    { id: 5, nickname: 'Maggie', password: 'hasheddsdeasgfoapishf78' }
  ],

  findUser: function(nickname) {
    const result = find(this.users, function(o) { return o.nickname === nickname })
    return result
  }
}

export default User
