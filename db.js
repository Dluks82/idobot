const admin = require('firebase-admin')

const serviceAccount = require('./serviceAccountKey.json')

module.exports = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

let collection = async (collectName) => {
    let path = await db.collection(collectName)
    return path
}

let searchUser = async (activeUser) => {
    let userCollection = await collection('users')
    let docId
    const snapshot = await userCollection.where('id', '==', activeUser.id).get()
    if (snapshot.empty) {
        console.log('=======> Nenhum usuário encontrado <=========')
        return
    }

    snapshot.forEach(doc => {
        // console.log(doc.id, '=>', doc.data())
        docId = doc.id
    })
    return docId
}

const insertUser = async (newUser) => {
    let userCollection = await collection('users')
    const resp = await userCollection.add(newUser)
    console.log("(insertUser) Inserido com ID: " + resp.id)

    return resp.id
}

const removeUser = async (activeUser) => {

    let userCollection = await collection('users')
    const docId = await searchUser(activeUser)
    let resp
    if (docId) {
        await userCollection
            .doc(docId)
            .delete()
            .then(() => {
                resp = `Usuário (${activeUser.details.firstName}) excluído com sucesso!!!`
                console.log(`(${activeUser.details.firstName}) excluido...`)
            })
    } else {
        resp = "Usuário não encontrado! Inicie com /start"
        console.log('(removeUser) Usuário não está no banco de dados!!!')
    }
    return resp
}

module.exports = { db, searchUser, insertUser, removeUser }