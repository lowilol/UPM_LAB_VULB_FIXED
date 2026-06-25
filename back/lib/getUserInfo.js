



const getUserInfo=(user)=> {
    return {
      id: user.id_user,
      email: user.email,
      name: user.FirstName + ' ' + user.LastName,
      rol: user.rol,
    };
  }
  
  module.exports = { getUserInfo };