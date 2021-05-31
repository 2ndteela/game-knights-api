module.exports = class ResponseMessage {
    constructor(StatusCode, Data, Message) {
        this.status = !StatusCode ? 200 : StatusCode
        this.data = !Data ? 'OK' : Data
        this.message = !Message ? 'OK' : Message
    }
}