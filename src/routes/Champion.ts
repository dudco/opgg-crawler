import axios from "axios";
import * as cheerio from "cheerio";
import {Router, Request, Response} from "express";

const router = Router();

async function getPage(url: string) {
    const html = await axios.get(`https://www.op.gg/champion/${url}`, {
        headers: {
            "Accept": "*/*",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
            "Accept-language": "ko"
        }
    });
    return cheerio.load(html.data);
}

interface Champion {
    id: number;
    key: string;
    name: string;
    image: any;
    position: string[];
}

router.get('/', async (req: Request, res: Response) => {
    const $ = await getPage("statistics");
    const ret: Champion[] = [];
    const keys: string[] = [];

    const championHtmlList = $("div.champion-index__champion-item");
    championHtmlList.each((_, elem) => {
        const elemAttr = $(elem).attr();

        const position: string[] = [];
        $(elem).find(".champion-index__champion-item__position").each((_, pElem) => {
            position.push($(pElem).text());
        });

        keys.push(elemAttr["data-champion-key"].toString());

        const data: Champion =  {
            id: 0,
            key: elemAttr["data-champion-key"].toString(),
            name: elemAttr["data-champion-name"].toString(),
            image: $(elem).find(".champion-index__champion-item__image > *").attr(),
            position,
        }
        ret.push(data);
    })

    keys.sort();
    
    ret.forEach((data) => {
        data.id = keys.indexOf(data["key"]);
    })
    res.json(ret);
});


// type: tear, winratio, pickratio, banratio
// postion: TOP, JUNGLE, MID, ADC, SUPPORT
router.get('/trend/:type/:position', async (req: Request<{position: string, type: string}>, res: Response) => {
    const $ = req.params.type === "tier" ? await getPage("statistics") : await getPage(`ajax/statistics/trendChampionList/type=${req.params.type}`);
    const ret: Object[] = [];

    $(`.champion-trend-${req.params.type}-${req.params.position.toUpperCase()} > tr`).each((_, elem) => {
        const rank = $(elem).find(".champion-index-table__cell--rank").text();
        let change = Number($(elem).find(".champion-index-table__cell--change").text());
        change *= $(elem).find(".champion-index-table__cell--change--down").length !== 0 ? -1 : 1
        const image = $(elem).find("i").attr();
        const name = $(elem).find(".champion-index-table__name").text();
        const position = $(elem).find(".champion-index-table__position").text().replace(/\n/g, "").replace(/\t/g, "");
        const winRate = req.params.type !== "tier" ? req.params.type !== "winratio" ?  req.params.type !== "pickratio" ? "" : $(elem).find("td:nth-child(5)").text() : $(elem).find("td:nth-child(4)").text() : $(elem).find("td:nth-child(5)").text();
        const pickRate = req.params.type !== "tier" ? req.params.type !== "winratio" ?  req.params.type !== "pickratio" ? "" : $(elem).find("td:nth-child(4)").text() : $(elem).find("td:nth-child(5)").text() : $(elem).find("td:nth-child(6)").text(); 
        const banRate = req.params.type === "banratio" ? $(elem).find("td:nth-child(4)").text() : "";
        const tierIcon = req.params.type === "tier" ? $(elem).find("td:nth-child(7) > img").attr()["src"] : "";

        const data = {
            rank,
            change,
            image,
            name,
            position,
            winRate,
            pickRate,
            banRate,
            tierIcon,
        }
        ret.push(data);
    });
    res.json(ret);
})

interface Rate {
    pick: {
        percentage: string;
        number: string;
    };
    win: string;
}

interface WinRate {
    win: string;
}

interface Item {
    image: string;
    description: string;
}

interface ChampionStat {
    position: {
        role: string;
        rate: string;
    }[];

    name: string;
    tier: string;
    skills: {
        image: string;
        video: string;
        description: string;
        key: string;
    }[];

    counter: {
        id: number;
        name: string;
        rate: WinRate;
    }[];

    discounter: {
        id: number;
        name: string;
        rate: WinRate;
    }[];

    recommend_spells: {
        spell: {
            image: string;
            description: string;
        }[];
        rate: Rate;
    }[];
    recommend_skill_build: {
        order: string[];
        rate: Rate;
    };
    recommend_item_build: {
        starting: {
            items:Item[];
            rate: Rate;
        }[];
        recommand: {
            items: Item[];
            rate: Rate;
        }[];
        shoes: {
            item: Item;
            rate: Rate;
        }
    }
    // ChampionKeystoneRune-1, ChampionKeystoneRune-2
    rune: {
        name: string;
        rate: Rate;
        images: {
            main: string;
            key: string;
            sub: string;
        }
    }[];
}

router.get('/:champ/:position', async (req: Request<{champ: string, position: string}>, res: Response) => {
    const $ = await getPage(`${req.params.champ}/statistics/${req.params.position}`);
    
    const ret = {};

    // get position
    $(".champion-stats-position champion-stats-header__position__role").each((_, elem) => {

    });
});

export default router;