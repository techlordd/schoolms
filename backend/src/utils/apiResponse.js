// src/utils/apiResponse.js
const ok = (res, data, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

const created = (res, data, message = 'Created') =>
  res.status(201).json({ success: true, message, data });

const paginated = (res, data, total, page, limit) =>
  res.json({
    success: true,
    data,
    pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) },
  });

const noContent = (res) => res.status(204).send();

module.exports = { ok, created, paginated, noContent };
