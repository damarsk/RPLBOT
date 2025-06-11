const { ActivityType } = require('discord.js');
/** * @param {import('discord.js').Client} client */
module.exports = (client) => {
    console.log(`✅ ${client.user.tag} is online!`);

    const statusList = [
        { name: 'Barudak RPL', type: ActivityType.Watching }
      ];
      
      let index = 0;
      
      const updateStatus = () => {
        client.user.setPresence({
          activities: [statusList[index]],
          status: 'online'
        });
        
        index = (index + 1) % statusList.length;
        setTimeout(updateStatus, 5000);
      };
      
      updateStatus();
}