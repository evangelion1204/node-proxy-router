'use strict'

export default class Catalog {
    static instance() {
        return new Catalog()
    }

    articles() {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(
                    [
                        {name: 'product1'},
                        {name: 'product2'},
                        {name: 'product3'},
                        {name: 'product4'},
                        {name: 'product5'},
                        {name: 'product6'},
                        {name: 'product7'},
                        {name: 'product8'},
                        {name: 'product9'},
                    ]
                )
            }, Math.random() * 100 + 300)
        })
    }
}
