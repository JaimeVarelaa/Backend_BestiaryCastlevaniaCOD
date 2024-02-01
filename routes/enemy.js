const express = require("express");
const con = require("../database");
const router = express.Router();

router.get("/", (req, res) => {
  const sqlQuery = `
    SELECT
      e.id AS id_enemy,
      e.name AS enemy_name,
      e.lv,
      e.hp,
      e.exp,
      e.description AS enemy_description,
      s.poison,
      s.curse,
      s.stone,
      s.paralyzed,
      s.fire,
      s.ice,
      s.thunder,
      s.wind,
      s.earth,
      s.light,
      s.dark
    FROM
      enemy e
      LEFT JOIN stats s ON e.id = s.id_enemy;
  `;

  con.query(sqlQuery, (error, enemyRows) => {
    if (error) {
      res.status(500).send({ success: false, message: "Error en el servidor" });
      return;
    }

    const promises = enemyRows.map((enemy) => {
      return new Promise((resolve) => {
        const enemyDropped = [];
        const enemyStolen = [];

        const droppedQuery = `
          SELECT
            m.name,
            m.description,
            'material' AS category
          FROM
            enemy_drops ed
            LEFT JOIN enemy_dropped_materials edm ON ed.id = edm.id_enemy_drop
            LEFT JOIN materials m ON edm.id_material = m.id
          WHERE
            ed.id_enemy = ?
            AND m.id IS NOT NULL
          UNION ALL
          SELECT
            i.name,
            i.description,
            'item' AS category
          FROM
            enemy e
            LEFT JOIN enemy_drops ed ON e.id = ed.id_enemy
            LEFT JOIN enemy_dropped_items edi ON ed.id = edi.id_enemy_drop
            LEFT JOIN items i ON edi.id_item = i.id
          WHERE
            i.id IS NOT NULL
            AND e.id = ?
          UNION ALL
          SELECT
            w.name,
            w.description,
            'weapon' AS category
          FROM
            enemy e
            LEFT JOIN enemy_drops ed ON e.id = ed.id_enemy
            LEFT JOIN enemy_dropped_weapons edw ON ed.id = edw.id_enemy_drop
            LEFT JOIN weapons w ON edw.id_weapon = w.id
          WHERE
            w.id IS NOT NULL
            AND e.id = ?
          UNION ALL
          SELECT
            h.name,
            h.description,
            'helmet' AS category
          FROM
            enemy e
            LEFT JOIN enemy_drops ed ON e.id = ed.id_enemy
            LEFT JOIN enemy_dropped_helmets edh ON ed.id = edh.id_enemy_drop
            LEFT JOIN helmets h ON edh.id_helmet = h.id
          WHERE
            h.id IS NOT NULL
            AND e.id = ?
          UNION ALL
          SELECT
            ac.name,
            ac.description,
            'accessory' AS category
          FROM
            enemy e
            LEFT JOIN enemy_drops ed ON e.id = ed.id_enemy
            LEFT JOIN enemy_dropped_accessories edac ON ed.id = edac.id_enemy_drop
            LEFT JOIN accessories ac ON edac.id_accessories = ac.id
          WHERE
            ac.id IS NOT NULL
            AND e.id = ?
        `;

        const stolenQuery = `
          SELECT
            m.name,
            m.description,
            'material' AS category
          FROM
            enemy_steals es
            LEFT JOIN enemy_stolen_materials esm ON es.id = esm.id_enemy_steal
            LEFT JOIN materials m ON esm.id_material = m.id
          WHERE
            m.id IS NOT NULL
            AND es.id_enemy = ?
          UNION ALL
          SELECT
            i.name,
            i.description,
            'item' AS category
          FROM
            enemy_steals es
            LEFT JOIN enemy_stolen_items esi ON es.id = esi.id_enemy_steal
            LEFT JOIN items i ON esi.id_item = i.id
          WHERE
            i.id IS NOT NULL
            AND es.id_enemy = ?
          UNION ALL
          SELECT
            w.name,
            w.description,
            'weapon' AS category
          FROM
            enemy_steals es
            LEFT JOIN enemy_stolen_weapons esw ON es.id = esw.id_enemy_steal
            LEFT JOIN weapons w ON esw.id_weapon = w.id
          WHERE
            w.id IS NOT NULL
            AND es.id_enemy = ?
          UNION ALL
          SELECT
            h.name,
            h.description,
            'helmet' AS category
          FROM
            enemy_steals es
            LEFT JOIN enemy_stolen_helmets esh ON es.id = esh.id_enemy_steal
            LEFT JOIN helmets h ON esh.id_helmet = h.id
          WHERE
            h.id IS NOT NULL
            AND es.id_enemy = ?
          UNION ALL
          SELECT
            ac.name,
            ac.description,
            'accessory' AS category
          FROM
            enemy_steals es
            LEFT JOIN enemy_stolen_accessories esac ON es.id = esac.id_enemy_steal
            LEFT JOIN accessories ac ON esac.id_accessories = ac.id
          WHERE
            ac.id IS NOT NULL
            AND es.id_enemy = ?
          UNION ALL
          SELECT
            m.amount,
            '' AS description,
            'money' AS category
          FROM
            enemy_steals es
            LEFT JOIN enemy_stolen_money esm ON es.id = esm.id_enemy_steal
            LEFT JOIN money m ON esm.id_money = m.id
          WHERE
            m.id IS NOT NULL
            AND es.id_enemy = ?
        `;

        Promise.all([
          queryPromise(droppedQuery, [enemy.id_enemy, enemy.id_enemy, enemy.id_enemy, enemy.id_enemy, enemy.id_enemy]),
          queryPromise(stolenQuery, [enemy.id_enemy, enemy.id_enemy, enemy.id_enemy, enemy.id_enemy, enemy.id_enemy, enemy.id_enemy]),
        ]).then(([droppedRows, stolenRows]) => {
          enemyDropped.push(...droppedRows);
          enemyStolen.push(...stolenRows);

          resolve({
            id_enemy: enemy.id_enemy,
            enemy_name: enemy.enemy_name,
            lv: enemy.lv,
            hp: enemy.hp,
            exp: enemy.exp,
            enemy_description: enemy.enemy_description,
            stats: {
              poison: enemy.poison,
              curse: enemy.curse,
              stone: enemy.stone,
              paralyzed: enemy.paralyzed,
              fire: enemy.fire,
              ice: enemy.ice,
              thunder: enemy.thunder,
              wind: enemy.wind,
              earth: enemy.earth,
              light: enemy.light,
              dark: enemy.dark,
            },
             enemy_dropped: droppedRows,
            enemy_stolen: stolenRows,
          });
        });
      });
    });

    Promise.all(promises).then((result) => {
      res.json(result);
    });
  });
});

function queryPromise(query, params) {
  return new Promise((resolve, reject) => {
    con.query(query, params, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = router;
