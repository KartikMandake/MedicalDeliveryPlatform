const predictStock = require('./utils/predictStock');

(async () => {
    const data = await predictStock();
    console.log("📊 Predictions:\n", data);
})();