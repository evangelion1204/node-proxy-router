'use strict'

export default class Auth {
    static instance() {
        return new Auth()
    }

    login(username, password) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                if (username === 'miiwersen' && password === '123456') {
                    resolve(true)
                } else {
                    reslove(false)
                }
            }, 2000)
        })
    }
}
