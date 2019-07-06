const express = require('express');
const router = express.Router();

router.post('/chatbot', (req, res) => {
	console.log(req);
	res.status(200).json({
		status: 'SUCCESS'
	});
});

// router.get("/login", function(req, res) {
//   res.status(200).json({
//     status: "SUCCESS"
//   });
// });

module.exports = router;
