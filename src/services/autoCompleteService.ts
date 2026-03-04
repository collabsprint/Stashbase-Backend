import { sequelize } from '../models';

export const autocompleteService = {

  async autocomplete(userId: string, q: string) {

    const results = await sequelize.query(

      `
      SELECT id, title
      FROM "Stashes"
      WHERE "userId" = :userId
      AND "isDeleted" = false
      AND title ILIKE :query
      ORDER BY similarity(title, :rawQuery) DESC
      LIMIT 10
      `,

      {
        replacements: {
          userId,
          query: `${q}%`,
          rawQuery: q
        }
      }

    );

    return results[0];

  }

};