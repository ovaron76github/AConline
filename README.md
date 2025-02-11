# AConline
ArmyCreator online


Welcome to the army creator world for tabletop army lists. 

The ArmyCreator is a complete toolkit for army list generation and administration. 

It consists of the actual Click & Play army list generator ArmyCreator, AConline (online ArmyCreator), the DataCreator a tool for creating data files for almost any tabletop game and the CreatorCloud for convenient online management of army lists. 
All tools are easy to use and fully integrated. 

With the ArmyCreator the creation of army lists is just a matter of minutes. It calculates all math for you and allows you to quickly experiment with new ideas and approaches. 
After you finished your roster you can easily print it out or upload it to the CreatorCloud which allows you to watch and share your lists wherever you want (PC, Mobile, Tablet, Forums, …). 
Generated HTML roster are interactive and you can get all information you need for your gameplay at a fingertip. Rosters can be exported to HTML, text and BBcode.

This is the repository for the mobile/online ArmyCreator (AConline).

AConline needs a running ArmyCreator server in background which provides all data, calulations etc.
You can say that AConline is only an online user interface for ArmyCreator.

You can find the official running AConline at https://online.armycreator.de


# How to prepare development
For developing you need to download the following tools:

1. ArmyCreator: https://armycreator.de/foren/ArmyCreator_latest.zip
2. AConline enabling package: https://armycreator.de/foren/ACOnlineWebStarter.zip
3. Actual www folder of the AConline project (from github)

For installation you extract the content of ArmyCreator_latest.zip to one folder. After this you extract the content of ACOnlineWebStarter.zip into the same folder. Now you can replace the content of the www folder with the actual www folder from github.

After those steps you can start the ArmyCreator webserver by starting ACWebStarter.jar and click on "Start AConline server and open page in browser". Now you have a runnin local AConline instance on http://localhost:7070 or http://your-pc-ip:7070



#External libraries used by AConline
AConline is using the following libraries:

https://getbootstrap.com/

https://jquery.com/

https://popper.js.org/docs/v2/

https://github.com/shaack/bootstrap-input-spinner
