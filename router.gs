const Router = {
  dispatch: function (payload) {
    var matched = false;

    for (var i = 0; i < RULES.length; i++) {
      var rule = RULES[i];

      if (!rule.when(payload)) {
        continue;
      }

      matched = true;

      for (var j = 0; j < rule.execute.length; j++) {
        var handlerName = rule.execute[j];

        try {
          if (typeof globalThis[handlerName] !== 'function') {
            throw new Error('Handler tidak ditemukan: ' + handlerName);
          }

          Logger.log('[RUN HANDLER] ' + handlerName);
          globalThis[handlerName](payload);
          Logger.log('[HANDLER SUCCESS] ' + handlerName);

        } catch (err) {
          Logger.log('[HANDLER ERROR] ' + handlerName + ': ' + err.message);
          payload.errors.push(handlerName + ': ' + err.message);
        }
      }

      return {
        ok: payload.errors.length === 0
      };
    }

    if (!matched) {
      payload.errors.push('Tidak ada rule untuk label: ' + payload.label);
    }

    return {
      ok: false
    };
  }
};