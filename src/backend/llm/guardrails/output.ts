const FORBIDDEN_WORDS = [
   /je suis une ia/i,
   /en tant que modele/i,
   /en tant qu'ia/i,
   /prompt/
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