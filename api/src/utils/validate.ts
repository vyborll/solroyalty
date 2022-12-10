import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export default (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params') => (req: Request, res: Response, next: NextFunction) => {
	const { error } = schema.validate(req[property], { errors: { wrap: { label: false } } });
	if (error) {
		return res.status(400).json({ success: false, message: error.details[0].message });
	} else {
		next();
	}
};
