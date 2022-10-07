import Joi from 'joi';

function getListQuery(query: {[key: string]: Joi.AnySchema}): Joi.ObjectSchema<any> {
  const listQuery = Joi.object({
    ...query,
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    perPage: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10),
    since: Joi.date().iso(),
    until: Joi.date().iso(),
  }).with('since', 'until');

  return listQuery;
}

export default getListQuery;
