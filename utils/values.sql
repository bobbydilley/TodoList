INSERT INTO Users (Username, Password) VALUES ('bobbydilley', '$pbkdf2-sha256$29000$IKQ0ZowRIkQohbC2FoIwhg$9gMf8YkfzAU7GykhUoBesxMPvZPA2zDtlBQ5hhShK7g');
INSERT INTO Users (Username, Password) VALUES ('janedilley', '$pbkdf2-sha256$29000$IKQ0ZowRIkQohbC2FoIwhg$9gMf8YkfzAU7GykhUoBesxMPvZPA2zDtlBQ5hhShK7g');

INSERT INTO Tasks (Description, Username) VALUES ('Remember to take out the bins', 'bobbydilley');
INSERT INTO Tasks (Description, Username) VALUES ('Renew passport', 'bobbydilley');
INSERT INTO Tasks (Description, Username) VALUES ('Call driving instructor', 'bobbydilley');

INSERT INTO Tasks (Description, Username) VALUES ('Pick bobby up', 'janedilley');

INSERT INTO Tags (TagName, TaskID) VALUES ('passport', 2);

