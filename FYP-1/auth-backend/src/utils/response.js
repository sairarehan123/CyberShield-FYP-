const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

const fail = (res, status, code, message, fields) =>
  res.status(status).json({ success: false, error: { code, message, ...(fields ? { fields } : {}) } });

module.exports = { ok, fail };
