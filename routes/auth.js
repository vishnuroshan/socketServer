const express = require('express');
const router = express.Router();
const bdyprsr = require('body-parser');

router.post('/chatbot', (req, res) => {
	console.log('full-body:', req);
	console.log('body-method:', req.body, req.method);
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
