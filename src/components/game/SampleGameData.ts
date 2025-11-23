"use client"

export const assetUrls = [
  {
    "asset_id": "1",
    "name": "player1",
    "image_url": "https://picsum.photos/seed/cat/100/100"
  },
  {
    "asset_id": "1",
    "name": "player2",
    "image_url": "https://picsum.photos/seed/cat/100/100"
  },
  {
    "asset_id": "2",
    "name": "bg_mill",
    "image_url": "https://picsum.photos/seed/mill/1200/900"
  },
  {
    "asset_id": "3",
    "name": "bg_farm_fields",
    "image_url": "https://picsum.photos/seed/farm/1200/900"
  },
  {
    "asset_id": "4",
    "name": "bg_king_throne_room",
    "image_url": "https://picsum.photos/seed/throne/1200/900"
  },
  {
    "asset_id": "5",
    "name": "bg_ogre_castle_exterior",
    "image_url": "https://picsum.photos/seed/castle/1200/900"
  },
  {
    "asset_id": "6",
    "name": "bg_ogre_castle_interior",
    "image_url": "https://picsum.photos/seed/interior/1200/900"
  },
  {
    "asset_id": "7",
    "name": "bg_rabbit_field",
    "image_url": "https://picsum.photos/seed/rabbit/1200/900"
  },
  {
    "asset_id": "8",
    "name": "bg_river_bank",
    "image_url": "https://picsum.photos/seed/river/1200/900"
  },
  {
    "asset_id": "9",
    "name": "cat_with_boots",
    "image_url": "https://picsum.photos/seed/cat/100/100"
  },
  {
    "asset_id": "10",
    "name": "king",
    "image_url": "https://picsum.photos/seed/king/100/100"
  },
  {
    "asset_id": "11",
    "name": "ogre",
    "image_url": "https://picsum.photos/seed/ogre/100/100"
  },
  {
    "asset_id": "12",
    "name": "princess",
    "image_url": "https://picsum.photos/seed/princess/100/100"
  },
  {
    "asset_id": "13",
    "name": "boots",
    "image_url": "https://picsum.photos/seed/boots/100/100"
  },
  {
    "asset_id": "14",
    "name": "satchel",
    "image_url": "https://picsum.photos/seed/satchel/100/100"
  }
];

export const sampleGameData = {
  "players": {
    "sprites": [
      "player1",
      "player2"
    ],
    "player_size": 100
  },
  "layout": {
    "walkable_vertical_ratio": 0.5,
    "branch_directions": ["left", "right", "top", "bottom"]
  },
  "scenes": {
    "scene_01": {
      "background": "bg_mill",
      "music": "music_intro_theme",
      "narrator": {
        "lines": [
          "El molinero muere y deja su molino, burro y gato a sus hijos.",
          "El hijo menor solo recibe el gato y teme por su futuro.",
          "Se lamenta de su suerte con desesperanza."
        ]
      },
      "npcs": [
        {
          "id": "cat_with_boots",
          "x": 0.68,
          "y": 0.48,
          "dialog": "dialog_cat_intro",
          "gives_item": null
        }
      ],
      "items_ground": [],
      "branches": [
        {
          "direction": "right",
          "label": "Seguir a la siguiente escena",
          "target": "scene_02"
        }
      ]
    },
    "scene_02": {
      "background": "bg_mill",
      "music": "music_intro_theme",
      "narrator": {
        "lines": [
          "El gato anima al joven y pide unas botas y una bolsa.",
          "Nace la esperanza en la humilde casa."
        ]
      },
      "npcs": [
        {
          "id": "cat_with_boots",
          "x": 0.56,
          "y": 0.54,
          "dialog": "dialog_cat_boots",
          "gives_item": null
        }
      ],
      "items_ground": [
        {
          "item": "boots",
          "x": 0.4,
          "y": 0.59,
          "dialog": "dialog_get_boots"
        },
        {
          "item": "satchel",
          "x": 0.47,
          "y": 0.6,
          "dialog": "dialog_get_satchel"
        }
      ],
      "branches": [
        {
          "direction": "left",
          "label": "Volver al inicio",
          "target": "scene_01"
        },
        {
          "direction": "right",
          "label": "Salir a buscar fortuna",
          "target": "scene_03"
        }
      ]
    },
    "scene_03": {
      "background": "bg_rabbit_field",
      "music": "music_hunt_field",
      "narrator": {
        "lines": [
          "El gato, ya con botas y bolsa, va al campo en busca de presas.",
          "Caza un conejo y luego perdices usando su ingenio.",
          "Lleva los regalos al rey en nombre del Marqués de Carabás.",
          "Poco a poco, la fama de su amo crece."
        ]
      },
      "npcs": [
        {
          "id": "cat_with_boots",
          "x": 0.38,
          "y": 0.4,
          "dialog": "dialog_cat_hunt",
          "gives_item": "hunting_gifts"
        }
      ],
      "items_ground": [],
      "branches": [
        {
          "direction": "left",
          "label": "Regresar al molino",
          "target": "scene_02"
        },
        {
          "direction": "right",
          "label": "Visitar al rey",
          "target": "scene_king_room"
        }
      ]
    },
    "scene_king_room": {
      "background": "bg_king_throne_room",
      "music": "music_throne_room",
      "narrator": {
        "lines": [
          "El rey recibe a su invitado misterioso y agradece las ofrendas.",
          "La corte se asombra del Marqués."
        ]
      },
      "npcs": [
        {
          "id": "king",
          "x": 0.62,
          "y": 0.36,
          "dialog": "dialog_king_gift",
          "gives_item": null
        }
      ],
      "items_ground": [],
      "branches": [
        {
          "direction": "left",
          "label": "Volver al campo",
          "target": "scene_03"
        },
        {
          "direction": "right",
          "label": "Seguir el plan del gato",
          "target": "scene_04"
        }
      ]
    },
    "scene_04": {
      "background": "bg_river_bank",
      "music": "music_transformation",
      "narrator": {
        "lines": [
          "El gato guía a su amo al río y finge que se ahoga.",
          "El rey pasa y ordena socorrerlo.",
          "Al Marqués le visten con ropas reales.",
          "La princesa se enamora al instante."
        ]
      },
      "npcs": [
        {
          "id": "king",
          "x": 0.18,
          "y": 0.32,
          "dialog": "dialog_king_help",
          "gives_item": "royal_clothes"
        },
        {
          "id": "princess",
          "x": 0.8,
          "y": 0.35,
          "dialog": "dialog_princess_meeting",
          "gives_item": null
        },
        {
          "id": "cat_with_boots",
          "x": 0.55,
          "y": 0.48,
          "dialog": "dialog_cat_river",
          "gives_item": null
        }
      ],
      "items_ground": [],
      "branches": [
        {
          "direction": "left",
          "label": "Volver al trono del rey",
          "target": "scene_king_room"
        },
        {
          "direction": "right",
          "label": "Continuar al campo de trigo",
          "target": "scene_05"
        }
      ]
    },
    "scene_05": {
      "background": "bg_farm_fields",
      "music": "music_prosperity",
      "narrator": {
        "lines": [
          "Avanzan por campos donde el gato advierte a los campesinos.",
          "Gracias al temor, los trabajadores afirman al rey que las tierras son del Marqués.",
          "El rey se maravilla de sus riquezas."
        ]
      },
      "npcs": [
        {
          "id": "cat_with_boots",
          "x": 0.25,
          "y": 0.43,
          "dialog": "dialog_cat_workers",
          "gives_item": null
        }
      ],
      "items_ground": [],
      "branches": [
        {
          "direction": "left",
          "label": "Atrás, hacia el río",
          "target": "scene_04"
        },
        {
          "direction": "right",
          "label": "Ir al castillo del ogro",
          "target": "scene_06"
        }
      ]
    },
    "scene_06": {
      "background": "bg_ogre_castle_exterior",
      "music": "music_ogre_theme",
      "narrator": {
        "lines": [
          "El castillo del ogro corona las tierras.",
          "El gato se infiltra para enfrentar al aterrador dueño."
        ]
      },
      "npcs": [
        {
          "id": "ogre",
          "x": 0.65,
          "y": 0.39,
          "dialog": "dialog_ogre_meeting",
          "gives_item": null
        },
        {
          "id": "cat_with_boots",
          "x": 0.35,
          "y": 0.45,
          "dialog": "dialog_cat_ogre",
          "gives_item": "ogre_key"
        }
      ],
      "items_ground": [],
      "branches": [
        {
          "direction": "left",
          "label": "Retroceder a los campos",
          "target": "scene_05"
        },
        {
          "direction": "right",
          "label": "Acceder al banquete real",
          "target": "scene_ogre_banquet"
        }
      ]
    },
    "scene_ogre_banquet": {
      "background": "bg_ogre_castle_interior",
      "music": "music_final_banquet",
      "narrator": {
        "lines": [
          "El rey y su corte llegan al castillo y se les ofrece un espléndido banquete.",
          "El héroe se casa con la princesa.",
          "El gato, colmado de honores, vive una nueva vida."
        ]
      },
      "npcs": [
        {
          "id": "king",
          "x": 0.78,
          "y": 0.36,
          "dialog": "dialog_king_final",
          "gives_item": null
        },
        {
          "id": "princess",
          "x": 0.25,
          "y": 0.38,
          "dialog": "dialog_princess_final",
          "gives_item": null
        },
        {
          "id": "cat_with_boots",
          "x": 0.54,
          "y": 0.51,
          "dialog": "dialog_cat_final",
          "gives_item": null
        }
      ],
      "items_ground": [],
      "branches": [
        {
          "direction": "left",
          "label": "Atrás al exterior del castillo",
          "target": "scene_06"
        }
      ]
    }
  },
  "dialogs": {
    "dialog_cat_intro": [
      {
        "character": "cat_with_boots",
        "text": "No debéis afligiros, mi señor."
      },
      {
        "character": "cat_with_boots",
        "text": "Sólo dadme unas botas y una bolsa."
      },
      {
        "character": "cat_with_boots",
        "text": "Veréis que vuestra fortuna no es tan mala."
      }
    ],
    "dialog_cat_boots": [
      {
        "character": "cat_with_boots",
        "text": "¡Gracias por confiar en mí y darme lo que necesito!"
      },
      {
        "character": "cat_with_boots",
        "text": "Pronto traeré abundancia a esta casa."
      }
    ],
    "dialog_get_boots": [
      {
        "character": "narrator",
        "text": "Unas botas para el gato, listas para caminar el mundo."
      }
    ],
    "dialog_get_satchel": [
      {
        "character": "narrator",
        "text": "La bolsa: clave para las trampas del gato."
      }
    ],
    "dialog_cat_hunt": [
      {
        "character": "cat_with_boots",
        "text": "Con astucia y estas trampas, nada se me escapará."
      },
      {
        "character": "cat_with_boots",
        "text": "Llevaré la mejor caza al rey en nombre del Marqués de Carabás."
      }
    ],
    "dialog_king_gift": [
      {
        "character": "king",
        "text": "¡Oh! Qué espléndidos obsequios del Marqués de Carabás."
      },
      {
        "character": "king",
        "text": "Transmita usted mi agradecimiento a su amo."
      }
    ],
    "dialog_cat_river": [
      {
        "character": "cat_with_boots",
        "text": "Sólo guarda la calma, mi señor. Muy pronto serás conocido."
      }
    ],
    "dialog_king_help": [
      {
        "character": "king",
        "text": "¡Auxilio! ¡Que rescaten al Marqués de Carabás!"
      },
      {
        "character": "king",
        "text": "¿Sin ropas? ¡Tráiganle mi mejor vestimenta real!"
      },
      {
        "character": "king",
        "text": "Ahora sí pareces todo un noble, Marqués."
      }
    ],
    "dialog_princess_meeting": [
      {
        "character": "princess",
        "text": "Nunca había visto un caballero tan apuesto..."
      },
      {
        "character": "princess",
        "text": "¿Me permitiría acompañarle en el carruaje?"
      }
    ],
    "dialog_cat_workers": [
      {
        "character": "cat_with_boots",
        "text": "Buenos labradores, decid al rey que estas tierras son del Marqués de Carabás, si no..."
      },
      {
        "character": "cat_with_boots",
        "text": "Todo saldrá bien si hacéis lo que pido."
      }
    ],
    "dialog_ogre_meeting": [
      {
        "character": "ogre",
        "text": "¿Qué buscas en mi castillo, pequeño gato con botas?"
      },
      {
        "character": "ogre",
        "text": "Dicen que puedes verte convertido en cualquier animal..."
      },
      {
        "character": "ogre",
        "text": "¿Dudas de mi poder? ¡Observa!"
      }
    ],
    "dialog_cat_ogre": [
      {
        "character": "cat_with_boots",
        "text": "¡Admirable lo que puede hacer un ogro tan poderoso!"
      },
      {
        "character": "cat_with_boots",
        "text": "Pero, ¿serías capaz de transformarte también en un ratón?"
      },
      {
        "character": "cat_with_boots",
        "text": "¡Perfecto! Así el castillo ya tiene nuevo dueño."
      }
    ],
    "dialog_king_final": [
      {
        "character": "king",
        "text": "¡Nada me haría más feliz que tenerte como yerno!"
      },
      {
        "character": "king",
        "text": "Hoy comienza una nueva era para todos."
      }
    ],
    "dialog_princess_final": [
      {
        "character": "princess",
        "text": "Mi corazón ya es tuyo, Marqués."
      }
    ],
    "dialog_cat_final": [
      {
        "character": "cat_with_boots",
        "text": "Mi señor, la suerte te sonríe... y a mí también."
      }
    ]
  }
};
