const { generateDisprovenFacts } = require('../services/service');

exports.generateFacts = async (req, res) => {
    const { year, country } = req.body;

    try {
        const facts = await generateDisprovenFacts(year, country);
        res.status(200).json({ facts });
    } catch (error) {
        console.error('Error in generateFacts controller:', error);
        res.status(500).json({ message: 'Error generating facts' });
    }
};
