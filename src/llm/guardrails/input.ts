const FORBIDDEN_WORDS = [
   /ignore (les|tes) instructions/i,
   /ignore l'instruction/i,
   /ignore les instructions/i,
   /oublie ton role/i,
   /oublie ton /i,
   /oublie ta/i,
   /oublie tes/i,
   /prompt/i
];

export function blockBadPatterns(message : string) : {blockedResult :boolean, reason? : string}
{
    for (const pattern of FORBIDDEN_WORDS)
    {
        if (pattern.test(message))
        {
            return {blockedResult : true , reason: "injection"};
        }
    }
    return {blockedResult : false};
}