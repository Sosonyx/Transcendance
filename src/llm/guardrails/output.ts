const FORBIDDEN_WORDS = [
   /en tant que modele/i,
   /en tant qu'ia/i,
   /prompt/i,
   /lmao/i,
   /lmfao/i,
   /rofl/i
];

export function blockBadPatterns(message : string) : {blockedResult :boolean, reason? : string}
{
    for ( const pattern of FORBIDDEN_WORDS)
    {
        if (pattern.test(message))
        {
            return {blockedResult : true , reason: "injection"};
        }
    }
    return {blockedResult : false};
}