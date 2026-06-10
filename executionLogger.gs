function logExecution_(type, message, payload) {

  Logger.log(JSON.stringify({
    type: type,
    message: message,
    payload: payload || {},
    time: new Date().toISOString()
  }));
}