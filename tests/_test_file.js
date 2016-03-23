module.exports = `'use strict';
const db = require('../models');

exports.error = async function (query, {limit, skip, sort}) {
  query['query.error'] = {
    $not: /shareinfo|WeixinJSBridge|CTK/i
  };
  let result = await db.error.aggregate([
    {$match: query},
    {$group: {
      _id: '$query.error',
      count: {$sum: 1},
      origins: {$push: '$origin'},
      cities: {$push: '$city'},
      files: {$push: '$query'},
      userAgents: {$push: '$userAgent'},
      referrers: {$push: '$referrer'}}
    },
    {$limit: skip + limit},
    {$skip: skip},
    {$sort: sort}]).allowDiskUse(true).exec();

  result = result.map(item => {
    item.files.splice(10, item.files.length);
    item.files = item.files.map((file, i) => {
      let res = Object.assign(file, {
        file: file.file || item.referrers[i] || file.id,
        userAgent: item.userAgents[i],
        origin: item.origins[i],
        city: item.cities[i]
      });

      delete res.error;
      delete res.referrer;
      delete res.id;
      return res;
    });
    item.name = item._id;
    delete item.referrers;
    delete item.cities;
    delete item.origins;
    delete item._id;
    return item;
  });

  return result;
};

exports.perf = async function (query, {sort, limit, skip}) {
  query['query.perf.lookup'] = {$gte: 0, $lte: 10000};
  query['query.perf.waiting'] = {$gte: 0, $lte: 10000};
  query['query.perf.receiving'] = {$gte: 0, $lte: 10000};
  query['query.perf.parsing'] = {$gte: 0, $lte: 10000};
  query['query.perf.contentLoaded'] = {$gte: 0, $lte: 10000};
  query['query.perf.pageLoaded'] = {$gte: 0, $lte: 10000};

  let result = await db.perf.aggregate([
    {$match: query},
    {$group: {
      _id: '$city',
      lookup: {$avg: '$query.perf.lookup'},
      waiting: {$avg: '$query.perf.waiting'},
      receiving: {$avg: '$query.perf.receiving'},
      parsing: {$avg: '$query.perf.parsing'},
      contentLoaded: {$avg: '$query.perf.contentLoaded'},
      pageLoaded: {$avg: '$query.perf.pageLoaded'},
      count: {$sum: 1}
    }},
    {$limit: skip + limit},
    {$skip: skip},
    {$sort: sort}]).allowDiskUse(true).exec();

  return result;
};

exports.routeStatistic = async function (query, {limit, skip, sort}) {
  let result = await db.routeStatistic.aggregate([
    {$match: query},
    {$group: {
      _id: '$route',
      route: {$first: '$route'},
      createdAt: {$first: '$createdAt'},
      count: {$sum: '$count'}
    }},
    {$limit: skip + limit},
    {$skip: skip},
    {$sort: sort}]).allowDiskUse(true).exec();

  return result;
};
`;
