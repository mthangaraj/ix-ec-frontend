#!/bin/sh
ng build --aot --prod
rm -r /var/www/html/*
cp -r dist/* /var/www/html/
chmod 750 -R /var/www/html/
chown root:www-data -R /var/www/html/
