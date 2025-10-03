const socialLists = [
  {
    id: 0,
    Community: ['Facebook', 'Twitter', 'Youtube', 'Bluesky', 'Instagram'],
  },
  {
    id: 1,
    'Our Company': [
      'About',
      'Careers',
      'News',
      'Legal',
      'Terms',
      'Privacy',
      'Blog',
    ],
  },
  {
    id: 2,
    Support: [
      '24/7 Chat Support',
      'Virtual Assistant',
      'Feedback',
      'Referrals',
      'Bug Reports',
      'Law Enforcements',
    ],
  },
];

socialLists.map((socialList) => {
  return console.log(socialList);
});

const Footer = () => {
  return (
    <div
      className="align-element items-center justify-center align-middle mt-10"
      style={{ backgroundColor: '#161420' }}
    >
      <div className="flex flex-row text-left gap-x-5 items-center justify-center align-middle">
        {socialLists.map((socialList) => {
          return (
            <ul
              className="w-[280px] h-[250px] p-5"
              style={{ backgroundColor: '#080712' }}
              key={socialList.id}
            >
              <h1 className="text-lg font-bold">
                {Object.keys(socialList)[1]}
              </h1>
              <ul className="text-sm font-light gap-y-3">
                {Object.values(socialList)[1].map(
                  (links: string[], index: number) => {
                    return (
                      <li key={links[index]}>
                        <p>{links}</p>
                      </li>
                    );
                  }
                )}
              </ul>
            </ul>
          );
        })}
      </div>
    </div>
  );
};
export default Footer;
