dockerize -wait tcp://mysql:3306 -timeout 40s

echo "Start server"
npm start