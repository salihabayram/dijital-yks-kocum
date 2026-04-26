const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token bulunamadı. Lütfen giriş yapın.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id: ogrenci_id } artık her route'ta kullanılabilir
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token geçersiz veya süresi dolmuş.' });
    }
};

module.exports = verifyToken;