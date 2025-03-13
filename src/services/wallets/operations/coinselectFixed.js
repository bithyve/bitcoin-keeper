// baseline estimates, used to improve performance
var TX_EMPTY_SIZE = 4 + 1 + 1 + 4;
var TX_INPUT_BASE = 32 + 4 + 1 + 4;
var TX_INPUT_PUBKEYHASH = 107;
var TX_OUTPUT_BASE = 8 + 1;
var TX_OUTPUT_PUBKEYHASH = 25;
var TX_OUTPUT_SCRIPTHASH = 34;

function inputBytes(input) {
  return TX_INPUT_BASE + (input.script ? input.script.length : TX_INPUT_PUBKEYHASH);
}

function outputBytes(output) {
  return TX_OUTPUT_BASE + (output.script ? output.script.length : TX_OUTPUT_PUBKEYHASH);
}

function dustThreshold(output, feeRate) {
  /* ... classify the output for input estimate  */
  return inputBytes({}) * feeRate;
}

function transactionBytes(inputs, outputs) {
  return (
    TX_EMPTY_SIZE +
    (outputs[0]['isSegWit'] ? 2 : 0) +
    inputs.reduce(function (a, x) {
      return a + inputBytes(x);
    }, 0) +
    outputs.reduce(function (a, x) {
      return a + outputBytes(x);
    }, 0)
  );
}

function uintOrNaN(v) {
  if (typeof v !== 'number') return NaN;
  if (!isFinite(v)) return NaN;
  if (Math.floor(v) !== v) return NaN;
  if (v < 0) return NaN;
  return v;
}

function sumForgiving(range) {
  return range.reduce(function (a, x) {
    return a + (isFinite(x.value) ? x.value : 0);
  }, 0);
}

function sumOrNaN(range) {
  return range.reduce(function (a, x) {
    return a + uintOrNaN(x.value);
  }, 0);
}

var BLANK_OUTPUT_PUBKEY = outputBytes({});
var BLANK_OUTPUT_SCRIPT = TX_OUTPUT_BASE + TX_OUTPUT_SCRIPTHASH;

function finalize(inputs, outputs, feeRate) {
  var bytesAccum = transactionBytes(inputs, outputs);
  var feeAfterExtraOutput =
    feeRate * (bytesAccum + (outputs[0]['isMultisig'] ? BLANK_OUTPUT_SCRIPT : BLANK_OUTPUT_PUBKEY));
  var remainderAfterExtraOutput = sumOrNaN(inputs) - (sumOrNaN(outputs) + feeAfterExtraOutput);

  // is it worth a change output?
  if (remainderAfterExtraOutput > dustThreshold({}, feeRate)) {
    outputs = outputs.concat({ value: remainderAfterExtraOutput });
  }

  var fee = sumOrNaN(inputs) - sumOrNaN(outputs);
  if (!isFinite(fee)) return { fee: feeRate * bytesAccum };

  return {
    inputs: inputs,
    outputs: outputs,
    fee: fee,
  };
}

function blackjack(utxos, outputs, feeRate) {
  if (!isFinite(uintOrNaN(feeRate))) return {};

  var bytesAccum = transactionBytes([], outputs);

  var inAccum = 0;
  var inputs = [];
  var outAccum = sumOrNaN(outputs);
  var threshold = dustThreshold({}, feeRate);

  for (var i = 0; i < utxos.length; ++i) {
    var input = utxos[i];
    var inputBytes_ = inputBytes(input);
    var fee = feeRate * (bytesAccum + inputBytes_);
    var inputValue = uintOrNaN(input.value);

    // would it waste value?
    if (inAccum + inputValue > outAccum + fee + threshold) continue;

    bytesAccum += inputBytes_;
    inAccum += inputValue;
    inputs.push(input);

    // go again?
    if (inAccum < outAccum + fee) continue;

    return finalize(inputs, outputs, feeRate);
  }

  return { fee: feeRate * bytesAccum };
}

function accumulative(utxos, outputs, feeRate) {
  if (!isFinite(uintOrNaN(feeRate))) return {};
  var bytesAccum = transactionBytes([], outputs);

  var inAccum = 0;
  var inputs = [];
  var outAccum = sumOrNaN(outputs);

  for (var i = 0; i < utxos.length; ++i) {
    var utxo = utxos[i];
    var utxoBytes = inputBytes(utxo);
    var utxoFee = feeRate * utxoBytes;
    var utxoValue = uintOrNaN(utxo.value);

    // skip detrimental input
    if (utxoFee > utxo.value) {
      if (i === utxos.length - 1) return { fee: feeRate * (bytesAccum + utxoBytes) };
      continue;
    }

    bytesAccum += utxoBytes;
    inAccum += utxoValue;
    inputs.push(utxo);

    var fee = feeRate * bytesAccum;

    // go again?
    if (inAccum < outAccum + fee) continue;

    return finalize(inputs, outputs, feeRate);
  }

  return { fee: feeRate * bytesAccum };
}

// order by descending value, minus the inputs approximate fee
function utxoScore(x, feeRate) {
  return x.value - feeRate * inputBytes(x);
}

export function coinselect(utxos, outputs, feeRate) {
  utxos = utxos.concat().sort(function (a, b) {
    return utxoScore(b, feeRate) - utxoScore(a, feeRate);
  });

  // attempt to use the blackjack strategy first (no change output)
  var base = blackjack(utxos, outputs, feeRate);
  if (base.inputs) return base;

  // else, try the accumulative strategy
  return accumulative(utxos, outputs, feeRate);
}
